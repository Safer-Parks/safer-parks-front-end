// Loading interstitial for dashboard transition
document.addEventListener('DOMContentLoaded', function() {
    // Clear active state on page load (fixes back button issue)
    const interstitial = document.querySelector('.loading-interstitial');
    if (interstitial) {
        interstitial.classList.remove('active');
    }
    
    // Find all dashboard links
    const dashboardLinks = document.querySelectorAll('.dashboard-link');
    
    dashboardLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetUrl = this.getAttribute('href');
            
            // Show loading interstitial
            interstitial.classList.add('active');
            
            // Navigate after short delay
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 600);
        });
    });
});
