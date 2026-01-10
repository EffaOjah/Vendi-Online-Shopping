exports.getAboutPage = (req, res) => {
    res.render('pages/about', { title: 'Vendi - About Us' });
};

exports.getContactPage = (req, res) => {
    res.render('pages/contact', { title: 'Vendi - Contact Us' });
};

exports.getBlogPage = (req, res) => {
    res.render('pages/blog', { title: 'Vendi - Blog' });
};

exports.getCareersPage = (req, res) => {
    res.render('pages/careers', { title: 'Vendi - Careers' });
};

exports.getFAQPage = (req, res) => {
    res.render('pages/faq', { title: 'Vendi - FAQ' });
};
