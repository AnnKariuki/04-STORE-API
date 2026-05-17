const Product = require('../models/product')

const getAllProductsStatic = async (req, res) => {
    const products = await Product.find({}).sort('-name price')
    res.status(200).json({ products, numHits: products.length })
}

const getAllProducts = async (req, res) => {
    const { featured, company, name, sort, fields } = req.query
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

    if(fields) {
        const fieldsList = fields.split(',').join(' ')
        result = result.select(fieldsList)
    }
    const products = await result

    res.status(200).json({ products, numHits: products.length })
}

module.exports = {
    getAllProductsStatic,
    getAllProducts
}