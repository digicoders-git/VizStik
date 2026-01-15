import Employees from "../pages/Employees";
import AddEmployee from "../pages/AddEmployee";
import EditEmployee from "../pages/EditEmployee";
import ViewEmployee from "../pages/ViewEmployee";
import ManageOutlet from "../pages/ManageOutlet";
import ViewOutlet from "../pages/ViewOutlet";
import OutletMap from "../pages/OutletMap";
import Profile from "../pages/Profile";

import EmployeeAddedOutlets from "../pages/EmployeeAddedOutlets";

import ManagePrefield from "../pages/ManagePrefield";

export const AppRoute = [
  { path: "employees", component: Employees },
  // {path:'employees/add', component: AddEmployee},
  // {path:'employees/edit/:id', component: EditEmployee},
  { path: "employees/view/:id", component: ViewEmployee },
  { path: "employees/:id/outlets", component: EmployeeAddedOutlets },
  { path: "outlets", component: ManageOutlet },
  { path: "outlets/map", component: OutletMap },
  { path: "outlets/view/:id", component: ViewOutlet },
  { path: "master-data", component: ManagePrefield },
  { path: "profile", component: Profile },
];
