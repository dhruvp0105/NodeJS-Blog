document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.querySelector('.searchBtn');
    const searchBar = document.querySelector('.searchBar');
    const searchInput = document.getElementById('searchInput');
    const searchClose = document.getElementById('searchClose');

    searchButton.addEventListener('click', function () {
        searchBar.style.visibility = "visible"
        searchBar.classList.add('open');
        this.setAttribute("arai-expanded","true");
        searchInput.focus();
    })

    searchClose.addEventListener('click', function () {
        searchBar.style.visibility = "hidden"
        searchBar.classList.remove('open');
        this.setAttribute("arai-expanded","false");
    })
})

