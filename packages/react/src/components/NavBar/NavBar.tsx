import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import NavItem from './NavItem';
import NavBarTrigger from './NavBarTrigger';
import Scrim from '../Scrim';

interface NavBarProps {
  children: React.ReactNode;
  initialActiveIndex?: number;
  className?: string;
  collapsed?: boolean;
  navTriggerLabel?: string;
}

const NavBar = ({
  children,
  // no initial link as default
  initialActiveIndex = -1,
  className,
  collapsed = false,
  navTriggerLabel = 'MAIN MENU'
}: NavBarProps) => {
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const [showDropdown, setShowDropdown] = useState(false);
  const ulRef = useRef<HTMLUListElement>(null);

  const navItems = React.Children.toArray(children).filter(child => {
    return (child as React.ReactElement<any>).type === NavItem;
  });

  const handleClick = (index: number) => {
    setActiveIndex(index);
    // closes dropdown when a menu is selected
    if (collapsed) {
      setShowDropdown(!showDropdown);
    }
  };

  const handleTriggerClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleNavBarFocus = (event: FocusEvent) => {
    const target = event.target as HTMLElement;
    if (target?.matches('.NavBar > ul > li > a')) {
      const targetRight = target.getBoundingClientRect().right;
      const ulRight = ulRef.current?.getBoundingClientRect().right;
      const ulWidth = ulRef.current?.offsetWidth;

      /* whenever the target's right end passes ul's, we scroll to
      the right by half of the ul's width */
      if (ulRight && ulWidth && targetRight >= ulRight) {
        ulRef.current?.scrollTo({
          top: ulRef.current?.scrollTop,
          left: ulRef.current?.scrollLeft + Math.round(ulWidth / 2),
          behavior: 'smooth'
        });
      }
    }
  };

  useEffect(() => {
    ulRef.current?.addEventListener('focusin', handleNavBarFocus);
    return () => {
      ulRef.current?.removeEventListener('focusin', handleNavBarFocus);
    };
  }, [ulRef.current]);

  const navItemComponents = navItems.map((child, index) => {
    const config = {
      className: classNames('NavItem', {
        // calculate index in unfiltered array of nav items
        'NavItem--active': index === activeIndex
      }),
      onClick: () => handleClick(index),
      ...(child as React.ReactElement<any>).props
    };

    return React.cloneElement(child as React.ReactElement<any>, config);
  });

  const navItemComponentsWithTrigger = (
    <>
      <NavBarTrigger
        show={showDropdown}
        handleTriggerClick={handleTriggerClick}
      >
        {navTriggerLabel}
      </NavBarTrigger>
      {showDropdown && navItemComponents}
    </>
  );

  return (
    <nav
      className={classNames('NavBar', className, {
        'NavBar--trigger': collapsed
      })}
    >
      <Scrim show={showDropdown} />
      <ul ref={ulRef}>
        {collapsed ? navItemComponentsWithTrigger : navItemComponents}
      </ul>
    </nav>
  );
};

NavBar.displayName = 'NavBar';
NavBar.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  collapsed: PropTypes.bool,
  navTriggerLabel: PropTypes.string
};

export default NavBar;
