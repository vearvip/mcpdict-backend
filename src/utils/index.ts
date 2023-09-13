export const notEmptyArr = (val: any) => {
  if (val && Array.isArray(val) && val.length > 0) {
    return true
  }
  return false
}