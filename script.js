
    const menuButton = document.querySelector(".menu-toggle");
    const navigation = document.querySelector(".nav-links");

    menuButton.addEventListener("click", () => {
      const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isExpanded));
      navigation.classList.toggle("is-open", !isExpanded);
    });

    navigation.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        menuButton.setAttribute("aria-expanded", "false");
        navigation.classList.remove("is-open");
      }
    });

    document.querySelector("#year").textContent = new Date().getFullYear();

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });

      document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    } else {
      document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
    }
  