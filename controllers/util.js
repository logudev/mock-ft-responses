exports.formatUnhandledErrors = (err) => {
  console.log(err.message);
  return res.status(500).json({
    success: false,
    error: 'Server Error',
  });
};
