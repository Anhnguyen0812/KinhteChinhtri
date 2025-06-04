// Dark mode functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // Check for saved theme preference or prefer-color-scheme
    const savedTheme = localStorage.getItem('theme');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Function to set the theme
    function setTheme(theme) {
        if (theme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
        }
    }
    
    // Initial theme setup
    if (savedTheme === 'dark') {
        setTheme('dark');
    } else if (savedTheme === 'light') {
        setTheme('light');
    } else if (prefersDarkScheme.matches) {
        // If no saved preference, use system preference
        setTheme('dark');
    }
    
    // Theme toggle click handler
    themeToggle.addEventListener('click', function() {
        // Check current theme and toggle
        if (document.body.getAttribute('data-theme') === 'dark') {
            setTheme('light');
        } else {
            setTheme('dark');
        }
    });
});
