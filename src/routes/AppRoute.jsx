import Employees from "../pages/Employees";
import AddEmployee from "../pages/AddEmployee";
import EditEmployee from "../pages/EditEmployee";
import ViewEmployee from "../pages/ViewEmployee";
import ManageShop from "../pages/ManageShop";
import ViewShop from "../pages/ViewShop";
import Profile from "../pages/Profile";

import EmployeeAddedShops from "../pages/EmployeeAddedShops";

export const AppRoute = [
  {path:'employees', component: Employees},
  {path:'employees/add', component: AddEmployee},
  {path:'employees/edit/:id', component: EditEmployee},
  {path:'employees/view/:id', component: ViewEmployee},
  {path:'employees/:id/shops', component: EmployeeAddedShops},
  {path:'shops', component: ManageShop},
  {path:'shops/view/:id', component: ViewShop},
  {path:'profile', component: Profile}
]