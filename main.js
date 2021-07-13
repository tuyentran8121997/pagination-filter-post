const postApi = "http://localhost:3000/posts";

// Pagination
let itemPerPage = 6; //so item tren 1 trang
let currentPage = 1; //trang hien tai
let start = 0; // san pham bat dau
let end = itemPerPage; // san pham ket thuc

const btnNext = document.querySelector(".btn-next");
const btnPrev = document.querySelector(".btn-prev");

// Start app
getPosts(function (posts) {
  renderPosts(posts);
  renderListPage(posts);
  renderFilter(posts);
  handleFilterPosts(posts);
  searchPosts(posts);
});

//Get posts from api
function getPosts(callback) {
  fetch(postApi)
    .then((response) => response.json())
    .then(callback);
}

// // render filter
function renderFilter(posts) {
  const filterElement = document.querySelector(".my-sidebar__item");
  const html = new Set(
    posts.map(function (post) {
      return `
        <li class="sidebar__item">
            <a href="#" class="sidebar__link">${post.type}</a>
        </li>
        `;
    })
  );
  const output = [...html];
  filterElement.insertAdjacentHTML("afterend",output.join(""));
}

// Render posts
function renderPosts(posts) {
  const listPostBlock = document.querySelector(".post-list .row");
  const html = posts.map(function (post, index) {
    if (index >= start && index < end) {
      return `
            <div class="col l-4 m-6 c-12">
            <a onclick="renderPostById(${post.id})" href="#" class="post-item">
                <img src="${post.image}" alt="" class="post-item__img">
                <h3 class="post-item__title">${post.title}</h3>
                <p class="post-item__desc">${post.description}</p>
                </a>
            </div>
            `;
    }
  });
  listPostBlock.innerHTML = html.join("");
}

// Render Post by id
function renderPostById(id) {
  fetch(postApi + "/" + id)
    .then((res) => res.json())
    .then(function (data) {
      const modal = document.getElementById("myModal");
      const span = document.getElementsByClassName("close")[0];
      const content = document.querySelector(".my-modal-content");
      modal.style.display = "block";
      span.onclick = function () {
        modal.style.display = "none";
      };
      window.onclick = function (event) {
        if (event.target == modal) {
          modal.style.display = "none";
        }
      };
      html = `
            <h3>${data.title}</h3>
            <img style="max-width: 60rem; margin: auto" alt="" src="${data.image}">
            <div>${data.description}</div>
        `;
      content.innerHTML = html;
    });
}

// Render number list pagination
function renderListPage(posts) {
  const totalPages = Math.ceil(posts.length / itemPerPage);
  let html = "";
  for (let i = 1; i <= totalPages; i++) {
    html += `
            <li class="pagination-item">
                <a href="#" class="pagination-item__link">${i}</a>
            </li>
        `;
  }
  document
    .querySelector("#my-number-page")
    .insertAdjacentHTML("afterend", html);

  if (currentPage === 1) {
    document
      .querySelector(".pagination-item__link")
      .classList.add("pagination-item__link--active");
    btnPrev.classList.add("hide");
    btnNext.classList.add("show");
  }

  // change page button next
  btnNext.addEventListener("click", function (e) {
    e.preventDefault();
    currentPage++;
    if (currentPage === totalPages) {
      btnNext.classList.remove("show");
      btnNext.classList.add("hide");
    }
    btnPrev.classList.remove("hide");
    btnPrev.classList.add("show");
    const ele = document.querySelectorAll(".pagination-item__link");
    ele.forEach((item) => {
      item.classList.remove("pagination-item__link--active");
    });
    document
      .querySelectorAll(".pagination-item__link")
      [`${currentPage - 1}`].classList.add("pagination-item__link--active");
    getCurrentPage(currentPage);
  });

  //change page button prev
  btnPrev.addEventListener("click", function (e) {
    e.preventDefault();
    const ele = document.querySelectorAll(".pagination-item__link");
    currentPage--;
    if (currentPage === 1) {
      btnPrev.classList.remove("show");
      btnPrev.classList.add("hide");
    }
    ele.forEach((item) => {
      item.classList.remove("pagination-item__link--active");
    });
    document
      .querySelectorAll(".pagination-item__link")
      [`${currentPage - 1}`].classList.add("pagination-item__link--active");

    btnNext.classList.remove("hide");
    btnNext.classList.add("show");

    getCurrentPage(currentPage);
  });

  // change page number
  const pages = document.querySelectorAll(".pagination-item__link");
  const pageLength = pages.length;
  for (let i = 0; i < pageLength; i++) {
    pages[i].addEventListener("click", function (e) {
      e.preventDefault();
      const value = i + 1;
      currentPage = value;
      pages.forEach(function (element) {
        element.classList.remove("pagination-item__link--active");
      });
      this.classList.add("pagination-item__link--active");
      btnNext.classList.remove("hide");
      btnNext.classList.add("show");
      btnPrev.classList.remove("hide");
      btnPrev.classList.add("show");
      if (currentPage === 1) {
        btnPrev.classList.remove("show");
        btnPrev.classList.add("hide");
      }
      if (currentPage === totalPages) {
        btnNext.classList.remove("show");
        btnNext.classList.add("hide");
      }
      getCurrentPage(currentPage);
      getPosts(renderPosts);
    });
  }
}

// Get currentPage
function getCurrentPage(currentPage) {
  start = (currentPage - 1) * itemPerPage;
  end = currentPage * itemPerPage;
}

// Search posts
function searchPosts(posts) {
  const searchText = document.querySelector(".header__search-input");
  const searchBtn = document.querySelector(".header__search-btn");
  const noItem = document.querySelector(".no-result");

  searchText.addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      searchBtn.click();
    }
  });

  searchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const pagination = document.querySelector(".pagination");
    const searchTextInput = searchText.value.toLowerCase().trim();
    const result = posts.filter(
      (item) => item.title.toLowerCase().indexOf(searchTextInput) !== -1
    );
    if (result.length === 0) {
      noItem.style.display = "block";
    } else {
      noItem.style.display = "none";
    }
    pagination.style.display = "none";
    renderPosts(result);
  });
}

// filter posts
function handleFilterPosts(posts) {
  const filterButtons = document.querySelectorAll(".sidebar__link");
  const pagination = document.querySelector(".pagination");
  
  filterButtons.forEach((filterBtn) => {
    filterBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const textFilter = this.textContent;
      if (textFilter.toLowerCase() === "all") {
        renderPosts(posts);
        pagination.style.display = "flex";
      } else {
        const result = posts.filter((item) => item.type.includes(textFilter));
        pagination.style.display = "none";
        renderPosts(result);
      }
    });
  });
}
