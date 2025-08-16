document.addEventListener("DOMContentLoaded", function() {
  // Definieren Sie hier Ihre Social-Media-Profile
  const socialMediaLinks = [
    { name: "Facebook", url: "https://www.facebook.com/IhreSeite", iconClass: "fab fa-facebook-f" },
    { name: "Twitter", url: "https://twitter.com/IhrAccount", iconClass: "fab fa-twitter" },
    { name: "Instagram", url: "https://www.instagram.com/IhrAccount", iconClass: "fab fa-instagram" },
    { name: "LinkedIn", url: "https://www.linkedin.com/in/IhrProfil", iconClass: "fab fa-linkedin-in" }
  ];

  const footer = document.querySelector("footer");

  if (footer) {
    const socialList = document.createElement("ul");
    socialList.style.listStyle = "none";
    socialList.style.padding = "0";
    socialList.style.display = "flex";
    socialList.style.justifyContent = "center";
    socialList.style.gap = "20px"; // Abstand zwischen den Symbolen

    socialMediaLinks.forEach(link => {
      const listItem = document.createElement("li");
      const anchor = document.createElement("a");
      anchor.href = link.url;
      anchor.target = "_blank"; // Öffnet den Link in einem neuen Tab
      anchor.rel = "noopener noreferrer";
      anchor.setAttribute("aria-label", `Visit us on ${link.name}`);

      const icon = document.createElement("i");
      icon.className = link.iconClass;
      icon.style.fontSize = "24px"; // Größe der Symbole

      anchor.appendChild(icon);
      listItem.appendChild(anchor);
      socialList.appendChild(listItem);
    });

    footer.appendChild(socialList);
  } else {
    console.error(" No <footer> element found on the page.");
  }
});
