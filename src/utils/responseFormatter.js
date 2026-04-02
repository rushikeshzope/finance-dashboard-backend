export const sendSuccess = (res, data = null, statusCode = 200) => {
  const response = { success: true };
  if (data !== null) {
    // If data already contains pagination info, merge it nicely
    if (data.data && data.total !== undefined) {
      Object.assign(response, data);
    } else {
      response.data = data;
    }
  }
  return res.status(statusCode).json(response);
};

export const sendError = (res, message = 'An error occurred', statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};
