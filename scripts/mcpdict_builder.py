import os
import subprocess
import shutil
import sys
import time

class bcolors:
    HEADER = '\033[95m'  # 紫色
    OKBLUE = '\033[94m'  # 蓝色
    OKGREEN = '\033[92m'  # 绿色  
    ENDC = '\033[0m'  # 结束颜色  
    FLUORESCENT_GREEN = '\033[38;5;46m'  # 荧光绿色

def run_command_with_progress(command, cwd=None):
    """Run shell command with progress output."""
    start_time = time.time()
    result = subprocess.run(command, shell=True, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    end_time = time.time()
    elapsed_time = end_time - start_time

    for line in result.stdout.splitlines():
        print(line)
    for line in result.stderr.splitlines():
        print(line, file=sys.stderr)
    if result.returncode != 0:
        raise Exception(f"命令失败: {command}\n{result.stderr}")
    return elapsed_time

def check_pip_command():
    """Check if pip3 command exists, otherwise use pip."""
    try:
        # subprocess.run(["pip3", "--version"], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        subprocess.run(["python3 -m pip", "--version"], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return "python3 -m pip"
    except subprocess.CalledProcessError:
        return "pip"

def main():
    # 获取当前脚本的绝对路径
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # 定义路径
    # repo_url = "https://github.com/osfans/MCPDict.git"
    # repo_url = "https://kkgithub.com/osfans/MCPDict.git"
    # repo_url = "https://gitee.com/vearvip/MCPDict.git"
    repo_url = "https://gitcode.com/vearvip/MCPDict.git"
    
    repo_dir = os.path.join(script_dir, "MCPDict/")
    tools_dir = os.path.join(repo_dir, "tools/")
    requirements_file = os.path.join(tools_dir, "requirements.txt")
    make_script = os.path.join(tools_dir, "make.py")
    db_source_path = os.path.join(repo_dir, "app/src/main/assets/databases/mcpdict.db")
    db_target_dir = os.path.join(script_dir, "../src/database/")
    db_target_path = os.path.join(db_target_dir, "mcpdict.db")

    # 新增：定义额外要复制的文件路径
    geojson_source_path = os.path.join(repo_dir, "方言.geojson")
    geojson_target_path = os.path.join(db_target_dir, "方言.geojson")

    # 记录总开始时间
    total_start_time = time.time()

    # 初始化计时变量
    clone_time = 0
    install_time = 0
    make_time = 0
    move_time = 0

    # 总是删除 MCPDict 目录（如果存在），然后进行浅克隆
    if os.path.exists(repo_dir):
        print(f"{bcolors.FLUORESCENT_GREEN}正在删除现有的 MCPDict 目录...{bcolors.ENDC}")
        shutil.rmtree(repo_dir)  # 删除目录及其所有内容

    print(f"{bcolors.FLUORESCENT_GREEN}正在克隆仓库...{bcolors.ENDC}")
    print(f"仓库路径：{repo_url}")
    clone_time = run_command_with_progress(f"git clone --depth 1 --progress {repo_url} {repo_dir}")

    # 检查并选择合适的 pip 命令
    pip_command = check_pip_command()

    # 添加清华大学的 PyPI 镜像源
    pypi_mirror = "https://pypi.tuna.tsinghua.edu.cn/simple/"

    # 安装依赖
    print(f"{bcolors.FLUORESCENT_GREEN}正在安装依赖...{bcolors.ENDC}")
    install_time = run_command_with_progress(f"{pip_command} install -r {requirements_file} -i {pypi_mirror}")

    # 检查必要的文件是否存在
    required_files = [
        os.path.join(tools_dir, "tables/data/mulcodechar.dt")
    ]
    for file_path in required_files:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"文件不存在: {file_path}")

    # 运行 make.py 脚本
    print(f"{bcolors.FLUORESCENT_GREEN}正在运行 make.py 脚本...{bcolors.ENDC}")
    make_time = run_command_with_progress(f"python3 {make_script} -c", cwd=tools_dir)

    # 检查生成的数据库文件是否存在
    if not os.path.exists(db_source_path):
        raise FileNotFoundError(f"生成的数据库文件不存在: {db_source_path}")

    # 移动数据库文件
    print(f"{bcolors.FLUORESCENT_GREEN}正在移动数据库文件...{bcolors.ENDC}")
    move_start_time = time.time()
    if not os.path.exists(db_target_dir):
        os.makedirs(db_target_dir)
    shutil.copy2(db_source_path, db_target_path)

    # 检查并移动 方言.geojson 文件
    if os.path.exists(geojson_source_path):
        shutil.copy2(geojson_source_path, geojson_target_path)
    else:
        print(f"{bcolors.OKBLUE}警告: {geojson_source_path} 不存在，不会进行复制。{bcolors.ENDC}")

    move_time = time.time() - move_start_time

    # 记录总结束时间
    total_end_time = time.time()
    total_elapsed_time = total_end_time - total_start_time

    # 打印耗时信息
    print(f"{bcolors.OKBLUE}克隆仓库用了 {bcolors.HEADER}{clone_time:.2f} 秒{bcolors.OKBLUE}{bcolors.ENDC}")
    print(f"{bcolors.OKBLUE}安装依赖用了 {bcolors.HEADER}{install_time:.2f} 秒{bcolors.OKBLUE}{bcolors.ENDC}")
    print(f"{bcolors.OKBLUE}执行 make.py 用了 {bcolors.HEADER}{make_time:.2f} 秒{bcolors.OKBLUE}{bcolors.ENDC}")
    print(f"{bcolors.OKBLUE}移动 .db 文件和 geojson 文件用了 {bcolors.HEADER}{move_time:.2f} 秒{bcolors.OKBLUE}{bcolors.ENDC}")
    print(f"{bcolors.OKBLUE}总耗时 {bcolors.HEADER}{total_elapsed_time:.2f} 秒{bcolors.OKBLUE}{bcolors.ENDC}")

    print(f"{bcolors.OKGREEN}过程完成成功。{bcolors.ENDC}")

if __name__ == "__main__":
    main()
