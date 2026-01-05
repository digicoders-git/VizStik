import Employees from "../pages/Employees";
import AddEmployee from "../pages/AddEmployee";
import EditEmployee from "../pages/EditEmployee";
import ViewEmployee from "../pages/ViewEmployee";

export const AppRoute = [
  {path:'employees', component: Employees},
  {path:'employees/add', component: AddEmployee},
  {path:'employees/edit/:id', component: EditEmployee},
  {path:'employees/view/:id', component: ViewEmployee}
]