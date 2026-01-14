exports.getSearch = (req, res) => {
    res.render('product/search', { title: 'Vendi - Browse Products' });
};

exports.getListings = (req, res) => {
    // Check if there is a search query in the request
    const searchQuery = req.query.q || '';
    res.render('product/listings', {
        title: 'Vendi - All Listings',
        searchQuery: searchQuery
    });
};

exports.getListingDetail = (req, res) => {
    // Ideally, this would fetch product details by ID
    res.render('product/listing-detail', { title: 'Vendi - Product Details' });
};

exports.getSellerProfile = (req, res) => {
    // Ideally, this would fetch seller details by ID
    res.render('product/seller-profile', { title: 'Vendi - Seller Profile' });
};
