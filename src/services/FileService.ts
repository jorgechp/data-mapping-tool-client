import AuthService from "./AuthService";
import ConfigService from "./ConfigService";
import axios from "axios";

class FileService {
    private authService = new AuthService();
    private configService = new ConfigService();

    download(filename: string) {
        const headers = {
            'Authorization': 'Bearer ' + this.authService.hasCredentials()
        };

        return axios.get(this.configService.getConfig().api_url + '/files/download/' + filename, {
            headers: headers,
            responseType: 'blob'
        });

    }

    upload(data: FormData) {
        const headers = {
            'Authorization': 'Bearer ' + this.authService.hasCredentials()
        };

        return axios.post(this.configService.getConfig().api_url + '/files/upload', data, {headers: headers});

    }

    sample(filename: string) {
        const headers = {
            'Authorization': 'Bearer ' + this.authService.hasCredentials()
        };

        return axios.get(this.configService.getConfig().api_url + '/files/' + filename, {headers: headers});
    }

    inferences(filename: string){
        const headers = {
            'Authorization': 'Bearer ' + this.authService.hasCredentials()
        };

        return axios.get(this.configService.getConfig().api_url + '/files/inferences/' + filename, {headers: headers});
    }

}

export default FileService;