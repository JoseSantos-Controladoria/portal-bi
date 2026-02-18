const responseMessage = (res, { status, message }, err) => {
  if (err) console.log(err);
  return res.status(status).json({ message });
};

module.exports = {
  responseMessage,
};