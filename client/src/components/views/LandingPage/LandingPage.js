import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Icon, Col, Card, Row } from 'antd'

import ImageSlider from '../../utils/ImageSlider'
import CheckBox from './Sections/CheckBox'
import { continents } from './Sections/Datas'

const { Meta } = Card;


function LandingPage() {

    const [Products, setProducts] = useState([])
    const [Skip, setSkip] = useState(0)
    const [Limit, setLimit] = useState(8)
    const [PostSize, setPostSize] = useState(0)



    useEffect(() => {
        getProducts();
    }, [])

    const getProducts = (body) => {
        axios.post('/api/product/products', body)
            .then(res => {
                if (res.data.success) {
                    if (!body) {
                        setProducts(res.data.productInfo.slice(0, 8))
                    } else {
                        setProducts([...Products, ...res.data.productInfo])
                    }
                    console.log(res.data.postSize)
                    setPostSize(res.data.postSize);
                } else {
                    alert("상품들을 가져오는데 실패했습니다.")
                }
            })
    }

    const renderCards = Products.map((product, index) => {
        return (
            <Col lg={6} md={8} xs={24} key={index}>
                <Card
                    cover={<ImageSlider images={product.images} />}
                >
                    <Meta
                        title={product.title}
                        description={product.price}
                    />
                </Card>
            </Col>
        )
    })

    const loadMoreHandler = () => {

        let skip = Skip + Limit

        let body = {
            skip: skip,
            limit: Limit,
            loadMore: true
        }
        getProducts(body);
        setSkip(skip);
    }

    return (
        <div style={{ width: '75%', margin: '3rem auto' }}>
            <div style={{ textAlign: 'center' }}>
                <h2>Let's Travel Anywhere <Icon type="rocket" /></h2>
            </div>
            {/* Filter */}
            {/* CheckBox */}
            <CheckBox list={continents} />
            {/* RadioBox */}

            {/* Search */}

            {/* Cards */}
            <Row gutter="16">
                {renderCards}
            </Row>

            {PostSize > Limit &&
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button onClick={loadMoreHandler}>더보기</button>
                </div>
            }


        </div>
    )
}

export default LandingPage
