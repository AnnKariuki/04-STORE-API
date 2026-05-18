const Product = require('../models/product')

const getAllProductsStatic = async (req, res) => {
    const products = await Product.find({ price: { $gt: 30 } })
        .sort('price')
        .select('name price')
    // .limit(4)
    // .skip(1)
    res.status(200).json({ products, numHits: products.length })
}

const getAllProducts = async (req, res) => {
    const { featured, company, name, sort, fields, numericFilters } = req.query
    const queryObject = {}
    if (featured) {
        queryObject.featured = featured === 'true' ? true : false
    }
    if (company) {
        queryObject.company = company
    }
    if (name) {
        queryObject.name = { $regex: name, $options: 'i' }
    }
    if (numericFilters) {
        const operatorMap = {
            '>': '$gt',
            '>=': '$gte',
            '=': '$eq',
            '<': '$lt',
            '<=': '$lte',
        }
        const regEx = /\b(<|>|>=|=|<|<=)\b/g
        let filters = numericFilters.replace(regEx, (match) => `-${operatorMap[match]}-`)
        console.log(numericFilters)
        console.log(filters)

        const options =['price','rating']
        filters = filters.split(',').forEach((item) => {
            const [field, operator,value] = item.split('-')
            if(options.includes(field)){
                queryObject[field] = {[operator]: Number(value)}
            }
        })
    }
    console.log(queryObject)
    let result = Product.find(queryObject)
    //sort
    if (sort) {
        console.log(sort)
        const sortList = sort.split(',').map(item => item.trim()).join(' ')
        console.log(sortList)
        result = result.sort(sortList)
    } else {
        result = result.sort('createAt')
    }

    //fields to be returned
    if (fields) {
        const fieldsList = fields.split(',').join(' ')
        result = result.select(fieldsList)
    }
    //pagination
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit;

    result = result.skip(skip).limit(limit)
    //23
    //23 /7 = 4 pages -> 7,7,7,2
    const products = await result

    res.status(200).json({ products, numHits: products.length })
}

module.exports = {
    getAllProductsStatic,
    getAllProducts
}