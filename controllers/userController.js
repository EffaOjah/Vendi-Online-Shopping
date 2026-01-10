exports.getDashboard = (req, res) => {
    res.render('user/dashboard', { title: 'Vendi - Dashboard' });
};

exports.getProfile = (req, res) => {
    res.render('user/profile', { title: 'Vendi - Profile' });
};

exports.getSettings = (req, res) => {
    res.render('user/settings', { title: 'Vendi - Settings' });
};

exports.getPostAd = (req, res) => {
    res.render('user/post-ad', { title: 'Vendi - Post Ad' });
};

exports.getMyAds = (req, res) => {
    res.render('user/my-ads', { title: 'Vendi - My Ads' });
};

exports.getSavedItems = (req, res) => {
    res.render('user/saved-items', { title: 'Vendi - Saved Items' });
};

exports.getChat = (req, res) => {
    res.render('user/chat', { title: 'Vendi - Chat' });
};
