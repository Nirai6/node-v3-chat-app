const socket =  io()


//Elements
const $mesageForm =document.querySelector('#message-form')
const $messageFormInput = $mesageForm.querySelector('input')
const $messageFormButton = $mesageForm.querySelector('button')
const $locationButtom =document.querySelector("#send-location")
const $messages=document.querySelector("#messages")
const $location=document.querySelector("#locations")


//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate =document.querySelector("#location-template").innerHTML
const sidebarTemplate=document.querySelector("#sidebar-template").innerHTML
//options

const {username,room  }=Qs.parse(location.search,{ignoreQueryPrefix:true })


const autoscroll =()=>{
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight =$newMessage.offsetHeight+newMessageMargin
    console.log(newMessageHeight)


    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight


    const scrollOffset =$messages.scrollTop+visibleHeight

    if(containerHeight -newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight


    }
}

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(message)=>{
    console.log(message)
    const html=Mustache.render(locationTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML=html
    
})

document.querySelector('#message-form').addEventListener("submit",(e)=>{
e.preventDefault()

$messageFormButton.setAttribute('disabled','disabled')
    //disable
const message=e.target.elements.message.value
 socket.emit("sendMessage",message,(error)=>{
     //enable
     $messageFormButton.removeAttribute('disabled')
     $messageFormInput.value=''
     $messageFormInput.focus()
     if(error){
         return console.log(error)
     }
     console.log("message was delivered")
 })
})

$locationButtom.addEventListener('click',(e)=>{
    e.preventDefault()
    
    if (! navigator.geolocation){
        return alert("Geo location is not supported by ur browser")
    }
    $locationButtom.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
      
        
        socket.emit("sendLocation",{
        latitude:position.coords.latitude,
        longitude:position.coords.longitude
        },()=>{
            $locationButtom.removeAttribute('disabled')
            console.log("location shared")
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }

})