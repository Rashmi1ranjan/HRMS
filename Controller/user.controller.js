
const userService = require('../Service/user.service')

exports.createUser = async function(req,res){

    try{

        const {name,comapny_id,email,mobile,desgnation,password} = req.body

        const result = await userService.createUser({name,comapny_id,email,mobile,desgnation,password})



        
        res.status(200).json({
            success :true,
            message :"User created succefully",
            data : result || []
        })
        return


    }catch(error){
         res.status(500).json({
            success :false,
            message :error.message,
            data : []
        })
        return

    }

}
