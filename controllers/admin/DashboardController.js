const dashboardService = require('../../services/dashboard.service');

exports.dashboard = async (req, res) => {
  try {
    const data = await dashboardService.getDashboardData();

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      stats: data.stats,
      recentBookings: data.recentBookings,
      currentUser: req.user || (req.session && req.session.user) || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Loi tai dashboard');
  }
};
