exports.getPrivacyPolicy = (req, res) => {
    res.render('legal/privacy', { title: 'Vendi - Privacy Policy' });
};

exports.getTermsOfService = (req, res) => {
    res.render('legal/terms', { title: 'Vendi - Terms of Service' });
};
