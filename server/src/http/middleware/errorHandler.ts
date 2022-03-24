export function errorHandler(err, req, res, next) {
  console.error(err)

  if (res.headersSent) {
    return next(err)
  }

  res.status(500).send({
    error: 'Internal server error'
  })
}
