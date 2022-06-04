import axios from 'axios';

export default ({req}) => {
    if (typeof window === 'undefined') {

        // make request to ingress-nginx-controller
        return axios.create({
            baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            headers: req.headers
        });

    } else {

        // make request domain *
        return axios.create({
            baseURL: '/'
        });
    }
};