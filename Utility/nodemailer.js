import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    service : "gmail",
    auth : {
        user : process.env.USER_EMAIL ,
        pass : process.env.MAIL_PASSWORD ,
    }
})

export function sendMail(toAddress , subject , content){
        const mailOptions = {
            from : process.env.USER_EMAIL,
            to : toAddress,
            subject : subject,
            html : content
        }

        transporter.sendMail(mailOptions , (error,info)=>{
            if(error){
                console.log('error email' ,error)
            } else {
                console.log('email sent' , info.response)
            }
        })

        transporter.close()
}