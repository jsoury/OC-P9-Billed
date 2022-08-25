/**
 * @jest-environment jsdom
 */

import {
  getByTestId,
  screen,
  waitFor,
  getAllByTestId,
} from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
//import { jest } from "@jest/globals";

//import store from "../app/Store";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import BillContainer from "../containers/Bills";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";
import store from "../__mocks__/store";

//jest.mock("../app/store", () => mockStore);

beforeEach(() => {
  //jest.spyOn(mockStore, "bills");
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
    })
  );
});

// Init onNavigate
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({
    pathname,
  });
};

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    it("Then bill icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon).toHaveClass("active-icon");
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => a - b;
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
    it("then clicking on the new bill button should open the new bill page", async () => {
      const Bills = new BillContainer({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });
      document.body.innerHTML = BillsUI({ data: bills });

      const handleClickNewBill = jest.fn(() => Bills.handleClickNewBill());

      const buttonNewBill = screen.getByTestId("btn-new-bill");
      buttonNewBill.addEventListener("click", handleClickNewBill);
      userEvent.click(buttonNewBill);
      expect(handleClickNewBill).toHaveBeenCalled();
      await waitFor(() => screen.getByTestId("form-new-bill"));
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });

    it("then clicking on the eye button should open the modal", () => {
      const Bills = new BillContainer({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      document.body.innerHTML = BillsUI({ data: bills });
      // Mock modal comportment
      $.fn.modal = jest.fn();

      const eye = screen.getAllByTestId("icon-eye")[0];
      const handleClickIconEye = jest.fn(() => Bills.handleClickIconEye(eye));

      eye.addEventListener("click", handleClickIconEye);
      userEvent.click(eye);

      expect(handleClickIconEye).toHaveBeenCalled();

      const modale = document.querySelector("#modaleFile");
      expect(modale).toBeTruthy();
    });
    it("fetches bills from mock API GET", async () => {
      const Bills = new BillContainer({
        document,
        onNavigate,
        store: store,
        localStorage: window.localStorage,
      });
      const data = await Bills.getBills();

      expect(data).toHaveLength(4);
    });
  });
});

// test d'intégration GET
describe("Given I am a user connected as Employe", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(mockStore, "list");
      const bills = await mockStore.list();
      // getSpy must have been called once
      expect(getSpy).toHaveBeenCalledTimes(1);
      // The number of bills must be 4
      expect(bills.data.length).toBe(4);
      // localStorage.setItem(
      //   "user",
      //   JSON.stringify({
      //     type: "Employee",
      //     email: "a@employee@test.tld",
      //     password: "employee",
      //   })
      // );
      // const root = document.createElement("div");
      // root.setAttribute("id", "root");
      // document.body.append(root);
      // router();
      // window.onNavigate(ROUTES_PATH.Bills);
      // await waitFor(() => screen.getByText("Validations"));
      // const contentPending = await screen.getByText("En attente (1)");
      // expect(contentPending).toBeTruthy();
      // const contentRefused = await screen.getByText("Refusé (2)");
      // expect(contentRefused).toBeTruthy();
      // expect(screen.getByTestId("big-billed-icon")).toBeTruthy();
    });
    // describe("When an error occurs on API", () => {
    //   beforeEach(() => {
    //     jest.spyOn(mockStore, "bills");
    //     Object.defineProperty(window, "localStorage", {
    //       value: localStorageMock,
    //     });
    //     window.localStorage.setItem(
    //       "user",
    //       JSON.stringify({
    //         type: "Employee",
    //         email: "a@a",
    //       })
    //     );
    //     const root = document.createElement("div");
    //     root.setAttribute("id", "root");
    //     document.body.appendChild(root);
    //     router();
    //   });
    //   test("fetches bills from an API and fails with 404 message error", async () => {
    //     mockStore.bills.mockImplementationOnce(() => {
    //       return {
    //         list: () => {
    //           return Promise.reject(new Error("Erreur 404"));
    //         },
    //       };
    //     });
    //     window.onNavigate(ROUTES_PATH.Dashboard);
    //     await new Promise(process.nextTick);
    //     const message = await screen.getByText(/Erreur 404/);
    //     expect(message).toBeTruthy();
    //   });

    //   test("fetches messages from an API and fails with 500 message error", async () => {
    //     mockStore.bills.mockImplementationOnce(() => {
    //       return {
    //         list: () => {
    //           return Promise.reject(new Error("Erreur 500"));
    //         },
    //       };
    //     });

    //     window.onNavigate(ROUTES_PATH.Dashboard);
    //     await new Promise(process.nextTick);
    //     const message = await screen.getByText(/Erreur 500/);
    //     expect(message).toBeTruthy();
    //   });
    // });
  });
});
