// Sample dummy logic – you can connect to DB later
exports.getAllFunds = (req, res) => {
  res.json({
    message: 'List of all fund transactions',
  });
};

exports.createFundTransaction = (req, res) => {
  const { rental_id, amount, percentage, fund_amount } = req.body;
  // Add your DB insert logic here

  res.status(201).json({
    message: 'Fund transaction created',
    data: { rental_id, amount, percentage, fund_amount },
  });
};
