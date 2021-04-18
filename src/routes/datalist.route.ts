import type { AppRoute } from "../components/router/AppRoute";
import { DisplayRoutedComponent } from "../components/router/DisplayRoutedComponent";
import DataListPage from '../pages/datalist/DataListPage.svelte';

export const DataListRoute : AppRoute = {
  url_pattern : 'datalist',
  onActivation : DisplayRoutedComponent(DataListPage)
}