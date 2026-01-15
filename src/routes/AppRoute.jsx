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
import BranchAnalysis from "../pages/BranchAnalysis";
import BranchUsers from "../pages/BranchUsers";

export const AppRoute = [
  { path: "employees", component: Employees },
  { path: "employees/view/:id", component: ViewEmployee },
  { path: "employees/:id/outlets", component: EmployeeAddedOutlets },
  { path: "outlets", component: ManageOutlet },
  { path: "outlets/map", component: OutletMap },
  { path: "outlets/view/:id", component: ViewOutlet },
  { path: "master-data", component: ManagePrefield },
  { path: "branch-analysis", component: BranchAnalysis },
  { path: "branch-users/:role/:branch", component: BranchUsers },
  { path: "profile", component: Profile },
];
