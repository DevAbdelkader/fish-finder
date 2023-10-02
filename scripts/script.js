/*
#############
Hello, I am Abdelkader, This is my code for this project, you are free to copy/paste anything from here
This code contains comments for each function or block of code, have fun reading this code!
#############
*/

(async function dishesLoader() {
    let dishTimeout,
    intervals = [],
    index = 0;

    const dishes    = await fetch("../dishes.json").then(res => res.json()),
    buttons   = document.querySelectorAll("#slider-controllers > button"),
    slider    = document.getElementById("dishes-slider-content");

    // Typing function

    function typing(element, value) {
        element.innerHTML = '';
        let index=0;
        let typingF = setInterval(_ => {
            index == value.length - 1 ? ( () => { clearInterval(typingF); intervals.splice(intervals.indexOf(typingF),1);  })() : "";
            index == value.length -1 ? clearInterval(typingF) : "";
            element.innerHTML += value[index];
            index++;
        }, 40);
        intervals.push(typingF);
    }

    // Update dish inforamtion

    update();
    function update() {
        index < 0 ? index += 8 : "";
        index > 7 ? index -= 8 : "";
        
        slider.style.transition = "none";
        slider.style.transform = "rotateZ("+ (-45 + index * -45) +"deg)";
        document.querySelectorAll(".dish")[index].classList.add("selected");
        
        // Write dish info

        typing(document.getElementById("dish-title-value"), dishes[index].name);
        typing(document.getElementById("dish-content-value"), dishes[index].content);

        // Print out the reviews

        document.getElementById("reviews").innerHTML = "";
        dishes[index].reviews.forEach(review => {
            let div = document.createElement("div");
            div.classList.add("dish-review");

            let content = document.createElement("div");
            content.classList.add("font-montserrat-400");
            content.innerHTML = review.review;

            let reviewer = document.createElement("div");
            reviewer.className = "reviewer font-charmonman";
            reviewer.innerHTML = review.reviewer;

            div.appendChild(content);
            div.appendChild(reviewer);

            document.getElementById("reviews").appendChild(div);
        })
    }

    function changeRotate() {
        clearTimeout(dishTimeout);
        intervals.forEach(interval => clearInterval(interval));
        document.querySelectorAll(".dish").forEach(dish => dish.classList.remove("selected"));
        slider.style.transition = ".4s";
        slider.style.transform = "rotateZ("+ (-45 + index * -45) +"deg)";
        dishTimeout = setTimeout(update, 400);
    }

    // Slider Buttons function

    buttons.forEach(btn => btn.addEventListener("click", _ => {
        btn.id == "next" && index > -1 ? index-- : "";
        btn.id == "prev" && index < 8 ? index++ : "";
        changeRotate();
    }))
    
    // Controlling Slider by sliding using mouse or touch screen

    let startPos;
    let lastPos = 0;

    function grabbingSlider({clientY}, speed = 200) {
        lastPos = -Math.round((startPos - clientY) / speed);
        slider.style.transition = ".4s";
        slider.style.transform = "rotateZ("+ (-45 + (index - (startPos - clientY) / speed) * -45) +"deg)";
    }
    function updateSliding() {
        slider.removeEventListener("mousemove",grabbingSlider);
        if (lastPos != 0) {
            index += lastPos;
            lastPos = 0;
            changeRotate();
        }else {
            slider.style.transition = ".4s";
            slider.style.transform = "rotateZ("+ (-45 + index * -45) +"deg)";
        }
    }

    slider.addEventListener("mousedown", e => {
        startPos = e.clientY;
        slider.addEventListener("mousemove", grabbingSlider)
    })
    
    slider.addEventListener("mouseup", updateSliding);
    slider.addEventListener("mouseleave", updateSliding);

    // Enable touching screens: Mobiles, Tablets

    slider.addEventListener("touchstart", ({touches: {0: {clientY}}}) => startPos = clientY);
    slider.addEventListener("touchmove", ({touches: { 0: clientYObj }}) => grabbingSlider(clientYObj, 150));
    slider.addEventListener("touchend" , updateSliding);

    // Slider Show/Hide

    const dishesContainer = document.getElementById("dishes");
    const sliderP = document.getElementById("dishes-slider");

    window.addEventListener("scroll", _ => dishesContainer.getBoundingClientRect().top < 200 && -dishesContainer.getBoundingClientRect().top < (dishesContainer.scrollHeight - 400) ? sliderP.classList.add("show") : sliderP.classList.remove("show"))

})()


// Magnetic scroll
let magnetic;
const sections = document.querySelectorAll(".section");

window.addEventListener("scroll", _ => {
    clearTimeout(magnetic);
    magnetic = setTimeout(_ => {
        sections.forEach(section => {
            let boundingClient = section.getBoundingClientRect();
            if(boundingClient.y < 200 && boundingClient.y > -200 ) {
                window.scrollBy({
                    top: boundingClient.y,
                    behavior: "smooth"
                })
            }
        });
    }, 90);
})

