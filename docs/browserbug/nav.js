const navSlide = ()=>{
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-content');
    const navLinks = document.querySelectorAll('.nav-links li');
    const btn = document.querySelector('.btn')

    burger.addEventListener('click', ()=>{
        nav.classList.toggle('nav-active');

        navLinks.forEach((link, index)=> {
            if(link.style.animation){
                link.style.animation ='';
            }else{
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 5 + .3}s`
            }  
                
        });

        if(btn.style.animation){
            btn.style.animation='';
        }else{
            btn.style.animation = `navLinkFade 0.5s ease forwards 1s`;
        }
        

        burger.classList.toggle('toggle');
    });

    
}

navSlide();

const house = document.querySelector('#house');
house.addEventListener('mouseover', ()=>{
    house.src = './website_images/house-wave.png';
    
});

house.addEventListener('mouseout', ()=>{
    house.src = './website_images/house.png';
   
});