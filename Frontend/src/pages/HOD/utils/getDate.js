export const getDate = (input)=>{
  if (typeof input === 'string') {
    return input.slice(0, 10); 
  } else if (input instanceof Date) {
    return input.toISOString().slice(0, 10);
  } else {
    return 'Invalid date';
  }
}
