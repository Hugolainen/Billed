import { screen, fireEvent  } from "@testing-library/dom"
import { ROUTES, ROUTES_PATH } from "../constants/routes";

import { localStorageMock } from "../__mocks__/localStorage"
import firebase from '../__mocks__/firebase';

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    let onNavigate;
    let container;
    beforeEach(() => {
      document.body.innerHTML = NewBillUI(); 
  
      onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })}
  
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
  
      container = new NewBill({
        document,
        onNavigate,
        firestore: false,
        localStorage,
      })
    })

    describe("When I add a file in the Fee input", () => {
      test("Then only files with .png, .jpg and .jpeg should be accepted", () => {
        // const fileInput = screen.getByTestId('file');

        // const handleChangeFile = jest.fn(screen.handleChangeFile);
        // fileInput.addEventListener('change', handleChangeFile);
        
        // const png = new File(["test"], "test.png", { type: "image/png" });
        // fireEvent.change(fileInput, { target: { file: png } });

        // expect(handleChangeFile).toHaveBeenCalled();
        // expect(fileInput.file.name).toBe('test.png');
      })
    })
    
    
    describe("When I completed the form and click on submit button", () => {
      test("Then a new bill should be created and billsUI loaded", () => {

      })
    })
  })
})