import Header from './Header'
import Footer from './Footer'
import { Outlet } from 'react-router'

const Layout = () => {
    return (
        <>
            <Header />
            <Outlet />
            <Footer />
        </>
    )
}

export default Layout