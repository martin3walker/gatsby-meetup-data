import { Link } from 'gatsby'
import React from 'react'
import layoutStyles from '../components/layout.module.css'

const Header = () => {
  const structure = [
    {
      name: 'Home',
      path: '',
      children: [
        {
          name: 'Content',
          path: '/content/',
          children: null,
        },
        {
          name: 'Communities ',
          path: '/communities/',
          children: [
            {
              name: 'Event Attendance',
              path: '/event-attendance/',
              children: null,
            },
            {
              name: 'Community Growth',
              path: '/community-growth',
              children: null,
            },
          ],
        },
      ],
    },
  ]

  const Menu = ({ data }) => {
    return (
      <ul style={{ listStyle: 'none' }}>
        {data.map(object => {
          return (
            <li style={{ marginLeft: -25, marginTop: 10 }}>
              <Link
                className={layoutStyles.menuItem}
                activeClassName={layoutStyles.menuActive}
                to={object.path}
              >
                {object.name}
              </Link>
              {object.children && <Menu data={object.children} />}
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <section className={layoutStyles.menuColumn}>
      <nav className={layoutStyles.menuContainer}>
        <Menu data={structure} />
      </nav>
    </section>
  )
}

export default Header
