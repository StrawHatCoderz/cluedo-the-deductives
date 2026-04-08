export const parseFormData = (form) => {
  const formdata = new FormData(form);
  return Object.fromEntries(formdata.entries());
};
