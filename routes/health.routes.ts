export const healthCheck = (req, res, next) => {
  return res.json({health:"true"})
};