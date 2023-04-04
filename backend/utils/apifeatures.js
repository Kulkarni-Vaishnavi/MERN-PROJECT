const res = require("express/lib/response");

class ApiFeatures {
    constructor(query,queryStr){
        this.query = query;// the query like product.find();
        this.queryStr = queryStr;// everything after the ? in params

    }

    search(){
        const keyword = this.queryStr.keyword ? {
            name : {
                $regex : this.queryStr.keyword,  ////prefix search  like samosa also searches for samosamosa
                $options : "i",  // case insensitive
            },
        } : {};

        //query -> here we are accesing from argument and the ...keyword -> regex generated regex
        this.query = this.query.find({...keyword});
        return this;
    }

    filter(){ // for categories  
        const queryCopy = {...this.queryStr} //passing a copy not by refernece

        // removing some feilds for category
        const removeFields = ["keyword", "page", "limit"];
        removeFields.forEach(key=>delete queryCopy[key]) // if we have any key in querycopy it will be deleted

        // filter for price nd rating
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, key =>`$${key}`);

        //stroing back the value in query and sending back
        this.query = this.query.find(JSON.parse(queryStr));//back to object
        return this;

    }

    pagination(resultPerPage){
        //page is an attr so we can access
        const currPage = Number(this.queryStr.page) || 1;
        const skip = resultPerPage * (currPage-1) // skipping that many products

        this.query = this.query.limit(resultPerPage).skip(skip); // inbuilt functions
        return this;

    }
}


module.exports = ApiFeatures;