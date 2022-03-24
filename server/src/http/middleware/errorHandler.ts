export function errorHandler(err: any, req: any, res: any, next: any) {
  console.error(err)

  if (res.headersSent) {
    return next(err)
  }

  res.status(500).send({
    error: 'Internal server error'
  })
}
