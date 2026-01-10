exports.getHelpCenter = (req, res) => {
    res.render('support/help-center', { title: 'Vendi - Help Center' });
};

exports.getSafetyTips = (req, res) => {
    res.render('support/safety-tips', { title: 'Vendi - Safety Tips' });
};
