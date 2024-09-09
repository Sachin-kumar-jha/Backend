class ApiResponse{
    constructor(statusCde,data,message="Success"){
 this.statusCde=statusCde
 this.data=data
 this.message=message
 this.success=statusCde < 400
    }
}

export {ApiResponse}