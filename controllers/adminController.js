exports.getDashboard = (req, res) => {
    res.render('admin/dashboard', { title: 'Vendi Admin - Dashboard' });
};

exports.getUsers = (req, res) => {
    res.render('admin/users', { title: 'Vendi Admin - Users' });
};

exports.getAds = (req, res) => {
    res.render('admin/ads', { title: 'Vendi Admin - Ads' });
};
