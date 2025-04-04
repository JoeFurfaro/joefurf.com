import * as React from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  React.useEffect(() => {
    const theme = localStorage.getItem("theme");
    if(!theme)
      localStorage.setItem("theme", "light");

    document.body.classList.add("theme-" + localStorage.getItem("theme"));
  }, []);

  return (
    <React.Fragment>
      <Outlet />
    </React.Fragment>
  )
}
