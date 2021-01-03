NO DOCKER RUN: checked. works. backend tests passed.
  - `sudo docker-compose -f docker-compose.db.redis.yml up --build`   # run redis and postgres
  - `cd server/taxi`                                                  # go to server/taxi dir
  - `conda activate env38_taxi`                                       # activate env38_taxi
  - `python manange.py runserver`                                     # run django dev server
  - `cd ../client`                                                    # go to client dir
  - `conda activate env_node_react`                                   # activate env_node_react
  - `npm start`                                                       # start frontend dev server



DOCKER RUN: checked, works. backend tests passed. Fronted tests passed.
  - `sudo docker-compose -f docker-compose.offline.dev.yml up --build` # run all you need in one shot.
  - `cd client`                                                        # cd to client for cypress testing
  - `conda activate env_node_react`                                    # activate env
  - `npx cypress open`                                                 # start cypress

REMEMBER! GO TO localhost:8080  to start using/testing the APP!


Clean the test database after each Cypress test run:
- `sudo docker-compose -f docker-compose.offline.dev.yml exec taxi-database psql -U taxi -d taxi`
- `TRUNCATE trips_user CASCADE;`


If have some errors while running the tests:
 - erase all docker volumes, and start containers up again.
