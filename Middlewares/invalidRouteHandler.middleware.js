const handleInvalidRoute = (req, res) => {
  res.render('404', {
    title: 'Not Found',
    cssFilePath: '/css/form.common.css',
    errorMessages: req.flash('errorMessages'),
    successMessages: req.flash('successMessages'),
  });
};

export default handleInvalidRoute;
