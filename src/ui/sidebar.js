const sideBar = document.getElementById("sidebar");
const sideBarBtn = document.getElementById("sidebar-btn");
let startX = null;

sideBarBtn.addEventListener("click", () => {
    sideBar.classList.toggle("show");
});

document.addEventListener("touchstart", event => {
    startX = event.touches[0].clientX;
});

document.addEventListener("touchend", event => {
    if (startX === null)
        return;

    const endX = event.changedTouches[0].clientX;
    const delta = endX - startX;

    if (delta > 300) {
        sideBar.classList.add("show");
    } else if (delta < -300) {
        sideBar.classList.remove("show");
    }

    startX = null;
});

let h=false;
let to=null;

document.addEventListener("touchstart", () => {
    if (h) {
        console.log("here");
       document.body.style.zoom = "100%"
    }
    
    h=true;
    setTimeout(() => {
        h = false
    }, 2000);
})