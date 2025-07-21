
export const getMonthName = (dateString)=>{
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { month: 'long' });
}
export default getMonthName;

export const getYear = (dateString)=>{
  const date = new Date(dateString);
  return date.getFullYear();
}