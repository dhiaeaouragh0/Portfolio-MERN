class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    // search(){
    //     const keyword = this.queryStr.keyword ? {
    //        name:{
    //          $regex: this.queryStr.keyword,
    //          $options: 'i' // case insensitive search
    //        }
    //     }:{}
    //     console.log(keyword)

    //     this.query = this.query.find({...keyword})
    //     return this;
    // }
    search() {
        const keyword = this.queryStr.keyword
            ? {
                  $or: [
                      { title: { $regex: this.queryStr.keyword, $options: 'i' } }, // Search in title
                      { description: { $regex: this.queryStr.keyword, $options: 'i' } }, // Search in description
                  ],
              }
            : {};
    
        console.log('Search Keyword:', keyword);
    
        this.query = this.query.find({ ...keyword });
        return this;
    }
    

    // filter(){
    //     const queryCopy = {...this.queryStr};
    //     //removing fields from the query
    //     const removeFields = ['keyword','limit','page']
    //     removeFields.forEach(el => delete queryCopy[el]);

        

    //     //Advance filter for price,rating etc
    //     let queryStr = JSON.stringify(queryCopy)
    //     queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g,match => `$${match}`);


    //     this.query = this.query.find(JSON.parse(queryStr));
    //     return this;
    // }
    filter() {
        const queryCopy = { ...this.queryStr };
    
        // Remove fields not meant for filtering
        const removeFields = ['keyword', 'limit', 'page', 'sort'];
        removeFields.forEach((el) => delete queryCopy[el]);
    
        // Advanced filtering for fields (e.g., createdAt[gte]=2024-01-01)
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    
        this.query = this.query.find(JSON.parse(queryStr));
    
        // Specific filter for description (case-insensitive partial match)
        if (this.queryStr.description) {
            const description = this.queryStr.description;
            this.query = this.query.find({ description: { $regex: description, $options: 'i' } });
        }
    
        return this;
    }
    
    
    

    pagination(resPerPage){
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = (currentPage - 1) * resPerPage;
        this.query = this.query.limit(resPerPage).skip(skip);
        return this;
    }

    sort() {
        if (this.queryStr.sort) {
            const sortBy = this.queryStr.sort.split(',').join(' ');
            console.log('Sorting by:', sortBy); // Debug log
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt'); // Default sort
        }
        return this;
    }

    
}

module.exports = APIFeatures;