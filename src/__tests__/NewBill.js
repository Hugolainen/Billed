import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from "@testing-library/user-event"
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { mockLocalStorage } from "../__mocks__/localStorage";



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {

    });

    describe("When I upload an image", () => {
      test("Then only images with .png, .jpg and .jpeg should be accepted", () => {

      })
    })
    
    
    describe("When I completed the form and click on submit button", () => {
      test("Then a new bill should be created and billsUI loaded", () => {

      })
    })
  })
})