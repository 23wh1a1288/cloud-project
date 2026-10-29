
const postForm = document.getElementById("postForm");
const usernameInput = document.getElementById("username");
const postContent = document.getElementById("postContent");
const postsContainer = document.getElementById("postsContainer");
const searchInput = document.getElementById("searchInput");

// Load saved posts from browser storage.
let posts = [];

try {
    posts = JSON.parse(localStorage.getItem("connectHubPosts")) || [];
    if (!Array.isArray(posts)) posts = [];
} catch {
    posts = [];
}

function savePosts() {
    localStorage.setItem("connectHubPosts", JSON.stringify(posts));
}

function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}

// Publish a new post.
postForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = usernameInput.value.trim();
    const content = postContent.value.trim();

    if (!name || !content) {
        alert("Please enter your name and post.");
        return;
    }

    posts.unshift({
        id: Date.now() + Math.random(),
        name: name,
        content: content,
        likes: 0,
        liked: false,
        comments: [],
        date: new Date().toLocaleString()
    });

    savePosts();
    renderPosts();

    postForm.reset();
});

// Display posts and search results.
function renderPosts() {
    postsContainer.replaceChildren();

    const query = searchInput.value.trim().toLowerCase();

    const filteredPosts = posts.filter(post =>
        post.name.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query)
    );

    if (filteredPosts.length === 0) {
        postsContainer.appendChild(
            createElement("p", "", "No posts found. Create a post!")
        );
        return;
    }

    filteredPosts.forEach(post => {
        const card = createElement("article", "post");

        card.appendChild(createElement("h3", "", post.name));
        card.appendChild(createElement("p", "", post.content));
        card.appendChild(createElement("small", "", post.date));

        const actions = createElement("div", "post-actions");

        const likeButton = createElement(
            "button",
            "",
            `${post.liked ? "❤️ Liked" : "🤍 Like"} (${post.likes})`
        );

        likeButton.addEventListener("click", () => {
            post.liked = !post.liked;
            post.likes += post.liked ? 1 : -1;

            savePosts();
            renderPosts();
        });

        actions.appendChild(likeButton);
        card.appendChild(actions);

        card.appendChild(createElement("h4", "", "Comments"));

        post.comments.forEach(comment => {
            const commentBox = createElement("div", "comment");

            commentBox.appendChild(
                createElement("strong", "", comment.name + ": ")
            );

            commentBox.appendChild(
                createElement("span", "", comment.text)
            );

            card.appendChild(commentBox);
        });

        const commentForm = createElement("form", "comment-form");

        const commentName = createElement("input");
        commentName.placeholder = "Your name";
        commentName.setAttribute("aria-label", "Your name");
        commentName.required = true;

        const commentText = createElement("input");
        commentText.placeholder = "Write a comment...";
        commentText.setAttribute("aria-label", "Write a comment");
        commentText.required = true;

        const commentButton = createElement("button", "", "Comment");
        commentButton.type = "submit";

        commentForm.append(commentName, commentText, commentButton);

        commentForm.addEventListener("submit", event => {
            event.preventDefault();

            const name = commentName.value.trim();
            const text = commentText.value.trim();

            if (!name || !text) return;

            post.comments.push({ name, text });

            savePosts();
            renderPosts();
        });

        card.appendChild(commentForm);
        postsContainer.appendChild(card);
    });
}

// Search while typing.
searchInput.addEventListener("input", renderPosts);

// Initial display.
renderPosts();
